defmodule Websocket do
  @moduledoc """
  A WebSocket client that listens for messages and processes them.
  """
  use WebSockex

  @ws_url Application.get_env(:your_app, :ws_url)
  @aggregators Application.get_env(:your_app, :aggregators)
  @vrf Application.get_env(:your_app, :vrf)

  # Start the WebSocket connection
  def start_link() do
    WebSockex.start_link(
      @ws_url,
      __MODULE__,
      %{},
      timeout: 10_000 # Timeout set to 10 seconds (10,000 milliseconds)
    )
  end

  # Handle WebSocket connection success
  def handle_connect(_conn, state) do
    IO.puts("WebSocket Client Connected")
    send_subscription_requests()
    {:ok, state}
  end

  # Handle incoming messages
  def handle_frame({:text, message}, state) do
    case Jason.decode(message) do
      {:ok, %{"payload" => %{"hash" => hash}} = data} ->
        if Map.get(data, "utf8Data") != "connected" do
          fetch_transaction_info(hash, state)
        else
          IO.puts("Connected")
        end

      {:error, _reason} ->
        IO.puts("Received non-JSON message: #{message}")
    end

    {:ok, state}
  end

  # Handle WebSocket connection closure
  def handle_disconnect(reason, state) do
    IO.puts("Connection Closed: #{inspect(reason)}")
    {:ok, state}
  end

  # Send subscription requests for all contract addresses
  defp send_subscription_requests() do
    @aggregators
    |> Enum.each(&send_subscription_request/1)
  end

  # Send a subscription request for a specific contract address
  defp send_subscription_request(contract_address) do
    subscription_request =
      %{
        op: "Subscribe",
        payload: "Object",
        target: contract_address
      }
      |> Jason.encode!()

    WebSockex.send_frame(__MODULE__, {:text, subscription_request})
  end

  # Fetch transaction info from external API
  defp fetch_transaction_info(hash, state) do
    url = "https://testnet.aeternity.io/v2/transactions/#{hash}/info"

    Task.start(fn ->
      case HTTPoison.get(url) do
        {:ok, %HTTPoison.Response{body: body, status_code: 200}} ->
          case Jason.decode(body) do
            {:ok, %{"call_info" => %{"log" => log}}} ->
              case log do
                [%{"topics" => [_ | [current_query_index]]} | _] ->
                  process_query_index(current_query_index, state)

                _ ->
                  :ok
              end

            _ ->
              IO.puts("Invalid response body")
          end

        {:error, reason} ->
          IO.puts("Error fetching transaction info: #{inspect(reason)}")
      end
    end)
  end

  # Process the query index if it hasn't been processed before
  defp process_query_index(current_query_index, state) do
    processed_index = Map.get(state, :processed_index, nil)

    if processed_index != current_query_index do
      fulfill_query(current_query_index)
      {:noreply, Map.put(state, :processed_index, current_query_index)}
    else
      {:noreply, state}
    end
  end

  # Simulated query fulfillment logic
  defp fulfill_query(current_query_index) do
    IO.puts("Fulfilling query index: #{current_query_index}")
  end
end
