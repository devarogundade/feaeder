defmodule Websocket.Main do
  use WebSockex

  @vrfs Application.compile_env(:websocket, :vrfs)
  @aggregators Application.compile_env(:websocket, :aggregators)
  @consumer_url Application.compile_env(:websocket, :consumer_url)

  # Start the WebSocket connection
  def start_link(ws_url) do
    WebSockex.start_link(
      ws_url,
      __MODULE__,
      %{},
      timeout: 20000
    )

    if Process.whereis(Websocket.Main) do
      IO.puts("Websocket.Main process is running.")
    else
      IO.puts("Websocket.Main process is not running.")
    end
  end

  # Define child_spec for compatibility with supervision trees
  def child_spec(arg) do
    %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [arg]},
      type: :worker,
      restart: :permanent
    }
  end

  def terminate(reason, _state) do
    IO.puts("WebSocket terminated: #{inspect(reason)}")
  end

  # Handle WebSocket connection success
  def handle_connect(_conn, state) do
    IO.puts("WebSocket Client Connected")

    # @aggregators
    # |> Enum.each(&send_subscription_request/1)

    {:ok, state}
  end

  # Handle incoming messages
  def handle_frame({:text, message}, state) do
    IO.puts("Received message: #{message}")

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
