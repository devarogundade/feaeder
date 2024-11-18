import Config

config :websocket, :default_settings, %{
  ws_url: "wss://testnet.aeternity.io/mdw/v2/websocket",
  aggregators: [
    "ct_284BS8M4mWXTji2HRYHkMjzx4dLzLqoqZeDA3KYsEf5djvUkEi",
  ],
  vrfs: [
    "",
    ""
  ]
}
