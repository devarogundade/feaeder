defmodule WebsocketTest do
  use ExUnit.Case
  doctest Websocket.Main

  test "greets the world" do
    assert {:ok, _pid} = Websocket.Main.start_link()
  end
end
