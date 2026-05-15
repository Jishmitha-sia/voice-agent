import asyncio
from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    cli,
)
from livekit.plugins import silero

# Load the environment variables
load_dotenv(".env.local")

# Initialize the Agent Server
server = AgentServer()

@server.rtc_session()
async def entrypoint(ctx: JobContext):
    # 1. Setup the core pipeline session with Voice Activity Detection
    session = AgentSession(
        vad=silero.VAD.load(),
        # stt=...,  <- We will plug in Faster-Whisper here next
        # llm=...,  <- We will plug in Llama 3 / Qwen here next
        # tts=...,  <- We will plug in Kokoro / Parler here next
    )

    # 2. Define the Agent's core instructions
    agent = Agent(
        instructions="You are an SRE Incident Commander. You manage server states.",
    )

    # 3. Start the session and connect it to the room
    await session.start(agent=agent, room=ctx.room)
    
    print("🚀 SRE Incident Commander is online and listening...")

if __name__ == "__main__":
    cli.run_app(server)