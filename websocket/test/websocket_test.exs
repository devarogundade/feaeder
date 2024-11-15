defmodule WebsocketTest do
  use ExUnit.Case
  doctest Websocket

  test "greets the world" do
    assert {:ok, _pid} = Websocket.start_link()
  end
end
