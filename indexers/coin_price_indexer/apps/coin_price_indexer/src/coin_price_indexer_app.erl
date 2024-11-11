%%%-------------------------------------------------------------------
%% @doc coin_price_indexer public API
%% @end
%%%-------------------------------------------------------------------

-module(coin_price_indexer_app).

-behaviour(application).

-export([start/2, stop/1, fetch_prices/0, fetch_from_coingecko/0, fetch_from_cmc/0]).

%% API URLs
-define(CMC_API_KEY, "92bdaf64-0563-48ef-8489-8acbb2eccf4c").
-define(CMC_API_URL, "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest").
-define(CG_API_URL, "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,litecoin").

start(_StartType, _StartArgs) ->
    coin_price_indexer_sup:start_link(),
    ssl:start(),
    application:start(inets),  %% Ensure inets application is started
    application:start(mongo),  %% Ensure MongoDB client is started
    io:format("Starting Coin Price Fetcher~n"),
    timer:send_interval(10000, self(), fetch_prices),  %% Fetch every 10 seconds
    fetch_prices().  %% Initial fetch

stop(_State) ->
    ok.

%% Fetch prices from CoinMarketCap (CMC)
fetch_from_cmc() ->
    Headers = [{"X-CMC_PRO_API_KEY", ?CMC_API_KEY}, {"Accept", "application/json"}],
    URL = ?CMC_API_URL ++ "?limit=5&convert=USD", %% Limit for testing, adjust as needed
    Options = [{ssl, [{verify, verify_none}]}],
    case httpc:request(get, {URL, Headers}, [], Options) of
        {ok, {{_, 200, _}, _, Body}} ->
            %% Decode JSON response using jsx
            {ok, Json} = jsx:decode(Body),
            Data = proplists:get_value(<<"data">>, Json),
            Prices = lists:map(fun(Entry) ->
                #{name => proplists:get_value(<<"name">>, Entry),
                  symbol => proplists:get_value(<<"symbol">>, Entry),
                  price => proplists:get_value(<<"price">>, proplists:get_value(<<"USD">>, proplists:get_value(<<"quote">>, Entry))),
                  timestamp => calendar:universal_time()}
            end, Data),
            {ok, Prices};
        {error, Reason} ->
            io:format("Error fetching from CMC: ~p~n", [Reason]),
            {error, Reason}
    end.

%% Fetch prices from CoinGecko (CG)
fetch_from_coingecko() ->
    URL = ?CG_API_URL,
    Options = [{ssl, [{verify, verify_none}]}],
    case httpc:request(get, {URL, []}, [], Options) of
        {ok, {{_, 200, _}, _, Body}} ->
            %% Decode JSON response using jsx
            {ok, Json} = jsx:decode(Body),
            Prices = lists:map(fun(Entry) ->
                #{name => proplists:get_value(<<"name">>, Entry),
                  symbol => proplists:get_value(<<"symbol">>, Entry),
                  price => proplists:get_value(<<"current_price">>, Entry),
                  timestamp => calendar:universal_time()}
            end, Json),
            {ok, Prices};
        {error, Reason} ->
            io:format("Error fetching from CoinGecko: ~p~n", [Reason]),
            {error, Reason}
    end.

%% Fetch and combine data from both APIs
fetch_prices() ->
    %% Fetch prices from both APIs
    {ok, CMCPrices} = fetch_from_cmc(),
    {ok, CGPrices} = fetch_from_coingecko(),
    
    %% Combine the results (CMC and CoinGecko)
    CombinedPrices = CMCPrices ++ CGPrices,

    %% Log prices for debugging
    io:format("Fetched and saved prices: ~p~n", [CombinedPrices]).