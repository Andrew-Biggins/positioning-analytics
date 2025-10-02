from backend.models import Market, MarketAlias
from sqlalchemy.orm import Session

def resolve_market(session: Session, source: str, source_symbol: str, canonical_name: str = None) -> Market:
    """
    Ensure a Market + alias exist for the given source symbol.
    If canonical_name is provided, reuse or create that Market.
    """
    # 1. Does an alias already exist?
    alias = (
        session.query(MarketAlias)
        .filter_by(source=source, source_symbol=source_symbol)
        .first()
    )
    if alias:
        return alias.market

    # 2. If canonical name was passed, try to reuse its Market
    market = None
    if canonical_name:
        market = session.query(Market).filter_by(name=canonical_name).first()

    # 3. If no Market yet, create one
    if not market:
        market = Market(name=canonical_name or source_symbol, symbol=canonical_name or source_symbol)
        session.add(market)
        session.commit()

    # 4. Create alias pointing at it
    alias = MarketAlias(market_id=market.id, source=source, source_symbol=source_symbol)
    session.add(alias)
    session.commit()

    return market



