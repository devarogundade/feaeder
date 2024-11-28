defmodule Websocket.Main do
  use WebSockex

  @vrfs Application.compile_env(:websocket, :vrfs)
  @aggregators Application.compile_env(:websocket, :aggregators)
  @consumer_url Application.compile_env(:websocket, :consumer_url)
  @aggregator_topic Application.compile_env(:websocket, :aggregator_topic)
  @vrf_topic Application.compile_env(:websocket, :vrf_topic)

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
                [%{"topics" => [topic | _], "data" => data}] ->
                  cond do
                    topic == @aggregator_topic ->
                      send_request_to_aggregator_consumer(data)
                    topic == @vrf_topic ->
                      send_request_to_vrf_consumer(data)
                    true ->
                      :ok
                  end

                _ ->
                  IO.puts("No valid log found")
              end

            _ ->
              IO.puts("Invalid response body")
          end

        {:error, reason} ->
          IO.puts("Error fetching transaction info: #{inspect(reason)}")
      end
    end)
  end

  # Send request to aggregator consumer
  defp send_request_to_aggregator_consumer(log_data) do
    # Skip the first element and extract address, queryId, and question
    [_first | [address, queryId, question]] = log_data

    body = Jason.encode!(%{address: address, queryId: queryId, question: question})

    # Send the POST request to the aggregator consumer
    case HTTPoison.post("#{@consumer_url}/aggregators/request", body, [{"Content-Type", "application/json"}]) do
      {:ok, %HTTPoison.Response{status_code: 200}} ->
        IO.puts("Aggregator request sent successfully.")

      {:error, reason} ->
        IO.puts("Error sending aggregator request: #{inspect(reason)}")
    end
  end

  # Send request to vrf consumer
  defp send_request_to_vrf_consumer(log_data) do
    # Skip the first element and extract requestId and to
    [_first | [requestId, to]] = log_data

    body = Jason.encode!(%{requestId: requestId, to: to})

    # Send the POST request to the VRF consumer
    case HTTPoison.post("#{@consumer_url}/vrf/request", body, [{"Content-Type", "application/json"}]) do
      {:ok, %HTTPoison.Response{status_code: 200}} ->
        IO.puts("VRF request sent successfully.")

      {:error, reason} ->
        IO.puts("Error sending VRF request: #{inspect(reason)}")
    end
  end
end
