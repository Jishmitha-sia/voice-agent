import asyncio
import aiohttp
from livekit.agents import function_tool, RunContext

KNOWN_SERVICES = {
    "github": "https://github.com/status",
    "google": "https://google.com",
    "frontend": "https://httpstat.us/200", 
    "database": "https://httpstat.us/500", # Fake broken server
}

@function_tool(description="Check the current status of a server or service (like 'github', 'google', or 'database').")
async def check_server_status(context: RunContext, server_name: str) -> str:
    print(f"\n🔍 [SYSTEM] Executing tool: Checking status for {server_name}...")
    target_url = KNOWN_SERVICES.get(server_name.lower())
    
    if not target_url:
         return f"I don't have a registered URL for {server_name}."

    try:
        async with aiohttp.ClientSession() as http_session:
            async with http_session.get(target_url, timeout=5) as response:
                if response.status == 200:
                    print(f"📊 [SYSTEM] Result: {server_name} is ONLINE (200 OK)\n")
                    return f"The {server_name} server is ONLINE."
                else:
                    print(f"⚠️ [SYSTEM] Result: {server_name} is DEGRADED ({response.status})\n")
                    return f"Warning: The {server_name} server returned HTTP {response.status}."
    except Exception as e:
        return f"CRITICAL: The {server_name} server is OFFLINE."

@function_tool(description="Restart a specific server. MUST ask the user for confirmation before using this tool.")
async def restart_server(context: RunContext, server_name: str) -> str:
    print(f"\n⚠️ [SYSTEM] Executing tool: RESTARTING {server_name.upper()}...")
    await asyncio.sleep(3) 
    print(f"✅ [SYSTEM] Result: {server_name} restarted successfully.\n")
    return f"Successfully restarted {server_name}."