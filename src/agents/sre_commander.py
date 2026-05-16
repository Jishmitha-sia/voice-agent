import asyncio
import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from livekit.agents import Agent, AgentServer, AgentSession, JobContext, cli
from livekit.plugins import silero, openai, deepgram
from src.tools.server_ops import check_server_status, restart_server

load_dotenv(".env.local")
server = AgentServer()

@server.rtc_session()
async def entrypoint(ctx: JobContext):
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(), 
        llm=openai.LLM(
            model="llama-3.3-70b-versatile", # Swapped to the active Groq Llama 3.3 model
            base_url="https://api.groq.com/openai/v1",
            api_key=os.environ.get("GROQ_API_KEY")
        ),
        tts=deepgram.TTS(), 
    )

    agent = Agent(
        instructions="""You are an SRE Incident Commander. Your job is to help engineers debug server issues. 
        Keep your responses extremely short and punchy.
        If the user asks about a server status, use your tool to check it.
        If a server is offline, suggest restarting it, but ALWAYS ask for confirmation first.
        Start the conversation by saying: 'Commander online. Awaiting system query.'""",
        tools=[check_server_status, restart_server], 
    )

    await session.start(agent=agent, room=ctx.room)
    print("🚀 SRE Incident Commander is online (100% Free Open-Source Pipeline)...")

if __name__ == "__main__":
    cli.run_app(server)