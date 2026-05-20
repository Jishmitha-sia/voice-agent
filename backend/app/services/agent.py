from dataclasses import dataclass

from app.services.llm import LLMClient


SYSTEM_PROMPT = """You are TouchGrass Support, a calm and practical customer support voice agent.
Help the customer with billing, order, account, and technical support questions.
Ask one focused follow-up question when required information is missing.
Do not invent policy details, order status, refunds, discounts, or account facts.
If a question requires company data that is not available yet, say what needs to be checked and offer to create or escalate a ticket.
Keep replies concise enough to be spoken naturally."""


@dataclass
class ConversationMessage:
    role: str
    content: str


class CustomerSupportAgent:
    def __init__(self, llm: LLMClient) -> None:
        self.llm = llm

    async def respond(self, message: str, history: list[ConversationMessage]) -> str:
        messages = [
            ConversationMessage(role="system", content=SYSTEM_PROMPT),
            *history[-12:],
            ConversationMessage(role="user", content=message),
        ]
        return await self.llm.generate(messages)
