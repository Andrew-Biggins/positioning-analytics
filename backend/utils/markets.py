from backend.models import Market, MarketAlias
from sqlalchemy.orm import Session
from backend.utils.market_mapping import CANONICAL_TO_NAME

def resolve_market(
    session: Session,
    source: str,
    source_symbol: str,
    canonical_name: str,
    symbol: str = None,
) -> Market:
    """
    Ensure a Market + alias exist for the given source symbol.
    - source: where this mapping came from (e.g. "cot", "yahoo")
    - source_symbol: raw identifier in that source (e.g. COT long name)
    - canonical_name: optional friendly name for the market
    - symbol: clean ticker/code (preferred)
    """
    # 1. Does an alias already exist?
    alias = (
        session.query(MarketAlias)
        .filter_by(source=source, source_symbol=source_symbol)
        .first()
    )
    if alias:
        return alias.market

    name = CANONICAL_TO_NAME.get(canonical_name, canonical_name)
    market = session.query(Market).filter_by(name=name).first()

    # 3. If no Market yet, create one with proper symbol + name
    if not market:
        market = Market(name=name,symbol=canonical_name)
        session.add(market)
        session.flush()

    # 4. Create alias pointing at it
    alias = MarketAlias(
        market_id=market.id,
        source=source,
        source_symbol=source_symbol,
    )
    session.add(alias)
    session.commit()

    return market


