COT_TO_CANONICAL = {
      # Crypto
    "BITCOIN - CHICAGO MERCANTILE EXCHANGE": "BTC",
    "MICRO BITCOIN - CHICAGO MERCANTILE EXCHANGE": "MBTC",
    "Nano Bitcoin - LMX LABS LLC": "NBTC",
    "ETHER CASH SETTLED - CHICAGO MERCANTILE EXCHANGE": "ETH",
    "MICRO ETHER - CHICAGO MERCANTILE EXCHANGE": "METH",
    "NANO ETHER - LMX LABS LLC": "NETH",
    "XRP - CHICAGO MERCANTILE EXCHANGE": "XRP",

    # Metals
    "GOLD - COMMODITY EXCHANGE INC.": "XAU",
    "MICRO GOLD - COMMODITY EXCHANGE INC.": "MGOLD",
    "SILVER - COMMODITY EXCHANGE INC.": "XAG",
    "PLATINUM - NEW YORK MERCANTILE EXCHANGE": "XPT",
    "PALLADIUM - NEW YORK MERCANTILE EXCHANGE": "XPD",
    "COPPER- #1 - COMMODITY EXCHANGE INC.": "HG",
    "COBALT - COMMODITY EXCHANGE INC.": "CO",
    "LITHIUM HYDROXIDE - COMMODITY EXCHANGE INC.": "LI",
    "ALUMINUM - COMMODITY EXCHANGE INC.": "AL",
    "STEEL-HRC - COMMODITY EXCHANGE INC.": "HRC",

    # Energy
    "CRUDE OIL, LIGHT SWEET-WTI - ICE FUTURES EUROPE": "CL",
    "BRENT LAST DAY - NEW YORK MERCANTILE EXCHANGE": "BZ",
    "NAT GAS NYME - NEW YORK MERCANTILE EXCHANGE": "NG",
    "RBOB CALENDAR - NEW YORK MERCANTILE EXCHANGE": "RB",
    "NY HARBOR ULSD - NEW YORK MERCANTILE EXCHANGE": "HO",

    # Agriculture
    "CORN - CHICAGO BOARD OF TRADE": "ZC",
    "SOYBEANS - CHICAGO BOARD OF TRADE": "ZS",
    "WHEAT-HRW - CHICAGO BOARD OF TRADE": "WHRW",
    "WHEAT-HRSpring - MINNEAPOLIS GRAIN EXCHANGE": "WHRS",
    "OATS - CHICAGO BOARD OF TRADE": "ZO",
    "SOYBEAN MEAL - CHICAGO BOARD OF TRADE": "ZM",
    "SOYBEAN OIL - CHICAGO BOARD OF TRADE": "ZL",
    "ROUGH RICE - CHICAGO BOARD OF TRADE": "ZR",
    "COTTON NO. 2 - ICE FUTURES U.S.": "CT",
    "COFFEE C - ICE FUTURES U.S.": "KC",
    "COCOA - ICE FUTURES U.S.": "CC",
    "SUGAR NO. 11 - ICE FUTURES U.S.": "SB",
    "CANOLA - ICE FUTURES U.S.": "RS",
    "FRZN CONCENTRATED ORANGE JUICE - ICE FUTURES U.S.": "OJ",

    # Livestock & Dairy
    "LIVE CATTLE - CHICAGO MERCANTILE EXCHANGE": "LE",
    "LEAN HOGS - CHICAGO MERCANTILE EXCHANGE": "HE",
    "FEEDER CATTLE - CHICAGO MERCANTILE EXCHANGE": "FC",
    "MILK, Class III - CHICAGO MERCANTILE EXCHANGE": "MK3",
    "CME MILK IV - CHICAGO MERCANTILE EXCHANGE": "MK4",
    "DRY WHEY - CHICAGO MERCANTILE EXCHANGE": "DW",
    "CHEESE (CASH-SETTLED) - CHICAGO MERCANTILE EXCHANGE": "CH",

    # Equity Indices
    "E-MINI S&P 500 - CHICAGO MERCANTILE EXCHANGE": "ES",
    "MICRO E-MINI S&P 500 INDEX - CHICAGO MERCANTILE EXCHANGE": "MES",
    "NASDAQ MINI - CHICAGO MERCANTILE EXCHANGE": "NQ",
    "MICRO E-MINI NASDAQ-100 INDEX - CHICAGO MERCANTILE EXCHANGE": "MNQ",
    "DJIA x $5 - CHICAGO BOARD OF TRADE": "YM",
    "MICRO E-MINI DJIA (x$0.5) - CHICAGO BOARD OF TRADE": "MYM",
    "RUSSELL E-MINI - CHICAGO MERCANTILE EXCHANGE": "RTY",
    "MICRO E-MINI RUSSELL 2000 INDX - CHICAGO MERCANTILE EXCHANGE": "M2K",

    # Currencies
    "EURO FX - CHICAGO MERCANTILE EXCHANGE": "6E",
    "BRITISH POUND - CHICAGO MERCANTILE EXCHANGE": "6B",
    "JAPANESE YEN - CHICAGO MERCANTILE EXCHANGE": "6J",
    "SWISS FRANC - CHICAGO MERCANTILE EXCHANGE": "6S",
    "CANADIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE": "6C",
    "AUSTRALIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE": "6A",
    "MEXICAN PESO - CHICAGO MERCANTILE EXCHANGE": "6M",
    "BRAZILIAN REAL - CHICAGO MERCANTILE EXCHANGE": "6BR",
    "NZ DOLLAR - CHICAGO MERCANTILE EXCHANGE": "6N",
    "SO AFRICAN RAND - CHICAGO MERCANTILE EXCHANGE": "6Z"
}

YAHOO_TO_CANONICAL = {
    # Metals
    "GC=F": "XAU",     # Gold
    "SI=F": "XAG",     # Silver
    "PL=F": "XPT",     # Platinum
    "PA=F": "XPD",     # Palladium
    "HG=F": "HG",      # Copper

    # Energy
    "CL=F": "CL",      # Light Sweet Crude Oil 
    "BZ=F": "BZ",      # Brent Crude Oil
    "NG=F": "NG",      # Natural Gas
    "HO=F": "HO",      # Heating Oil
    "RB=F": "RB",      # RBOB Gasoline

    # Agriculture
    "ZC=F": "ZC",      # Corn
    "ZS=F": "ZS",      # Soybeans
    "ZW=F": "ZW",      # Wheat
    "KC=F": "KC",      # Coffee
    "CT=F": "CT",      # Cotton
    "CC=F": "CC",      # Cocoa
    "OJ=F": "OJ",      # Orange Juice
    "LE=F": "LE",      # Live Cattle
    "HE=F": "HE",      # Lean Hogs

    # Equity Indices
    "ES=F": "ES",      # S&P 500
    "NQ=F": "NQ",      # Nasdaq 100
    "YM=F": "YM",      # Dow Jones
    "RTY=F": "RTY",    # Russell 2000

    # Currencies
    "6E=F": "6E",      # Euro FX
    "6B=F": "6B",      # British Pound
    "6J=F": "6J",      # Japanese Yen
    "6S=F": "6S",      # Swiss Franc
    "6C=F": "6C",      # Canadian Dollar
    "6A=F": "6A",      # Australian Dollar

    # Cryptos
    "BTC-USD": "BTC",
    "ETH-USD": "ETH",
    "XRP-USD": "XRP",
}

CANONICAL_TO_NAME = {
    # Crypto
    "BTC": "Bitcoin Futures (CME)",
    "ETH": "Ethereum Futures (CME)",
    "XRP": "XRP Futures (CME)",

    # Metals
    "XAU": "Gold Futures (COMEX)",
    "XAG": "Silver Futures (COMEX)",
    "XPT": "Platinum Futures (NYMEX)",
    "XPD": "Palladium Futures (NYMEX)",
    "HG": "Copper Futures (COMEX)",

    # Energy
    "CL": "Crude Oil Futures (NYMEX)",
    "BZ": "Brent Crude Futures (ICE)",
    "NG": "Natural Gas Futures (NYMEX)",
    "HO": "Heating Oil Futures (NYMEX)",
    "RB": "RBOB Gasoline Futures (NYMEX)",

    # Agriculture
    "ZC": "Corn Futures (CBOT)",
    "ZS": "Soybean Futures (CBOT)",
    "ZW": "Wheat Futures (CBOT)",
    "KC": "Coffee Futures (ICE)",
    "CT": "Cotton Futures (ICE)",
    "CC": "Cocoa Futures (ICE)",
    "OJ": "Orange Juice Futures (ICE)",
    "LE": "Live Cattle Futures (CME)",
    "HE": "Lean Hogs Futures (CME)",

    # Equity Indices
    "ES": "S&P 500 Futures (CME)",
    "NQ": "Nasdaq 100 Futures (CME)",
    "YM": "Dow Jones Futures (CBOT)",
    "RTY": "Russell 2000 Futures (CME)",

    # Currencies
    "6E": "Euro FX Futures (CME)",
    "6B": "British Pound Futures (CME)",
    "6J": "Japanese Yen Futures (CME)",
    "6S": "Swiss Franc Futures (CME)",
    "6C": "Canadian Dollar Futures (CME)",
    "6A": "Australian Dollar Futures (CME)"
}