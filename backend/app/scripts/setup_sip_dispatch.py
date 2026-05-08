"""
Setup SIP Dispatch Rule for Aleem Voice Agent
==============================================
Creates a dispatch rule that routes inbound calls from the SIP trunk
to the aleem-voice-agent. Each caller gets their own room.

Run once:
    cd backend
    python -m app.scripts.setup_sip_dispatch
"""

import asyncio
import os
from dotenv import load_dotenv

load_dotenv(".env.local", override=True)
load_dotenv(override=False)

from livekit import api


# ── SIP Trunk & Agent Config ───────────────────────────────────────
SIP_TRUNK_ID = os.getenv("SIP_TRUNK_ID", "ST_JT7r83zg3brC")
SIP_PHONE_NUMBER = os.getenv("SIP_PHONE_NUMBER", "4406848838")
AGENT_NAME = "aleem-voice-agent"


async def main():
    url = os.getenv("LIVEKIT_URL", "wss://aleem-voice-agent-44niowom.livekit.cloud")
    api_key = os.getenv("LIVEKIT_API_KEY", "")
    api_secret = os.getenv("LIVEKIT_API_SECRET", "")

    if not api_key or not api_secret:
        print("ERROR: LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set.")
        print("Make sure .env.local exists in the backend/ directory.")
        return

    lkapi = api.LiveKitAPI(url=url, api_key=api_key, api_secret=api_secret)

    # 1. Create an individual dispatch rule (one room per caller)
    #    linked to our inbound trunk and dispatching to our agent.
    rule = api.SIPDispatchRule(
        dispatch_rule_individual=api.SIPDispatchRuleIndividual(
            room_prefix="sip-call-",
        )
    )

    request = api.CreateSIPDispatchRuleRequest(
        rule=rule,
        name="Aleem Voice Agent Inbound",
        trunk_ids=[SIP_TRUNK_ID],
        room_config=api.RoomConfiguration(
            agents=[
                api.RoomAgentDispatch(
                    agent_name=AGENT_NAME,
                    metadata='{"source": "telephony", "trunk_id": "'
                    + SIP_TRUNK_ID
                    + '"}',
                )
            ]
        ),
    )

    try:
        dispatch = await lkapi.sip.create_dispatch_rule(request)
        print(f"Dispatch rule created successfully!")
        print(f"  ID:         {dispatch.sip_dispatch_rule_id}")
        print(f"  Name:       {dispatch.name}")
        print(f"  Trunk:      {SIP_TRUNK_ID}")
        print(f"  Agent:      {AGENT_NAME}")
        print(f"  Room prefix: sip-call-")
        print(f"\nInbound calls to {SIP_PHONE_NUMBER} will now be "
              f"routed to the {AGENT_NAME} agent.")
    except Exception as e:
        print(f"Error creating dispatch rule: {e}")
    finally:
        await lkapi.aclose()


if __name__ == "__main__":
    asyncio.run(main())
