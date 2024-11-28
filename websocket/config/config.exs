import Config

config :websocket,
  ws_url: "wss://testnet.aeternity.io/mdw/v3/websocket",
  feaeder: "ct_2naS9dLNZdTnc1m8fsKcSoDo8AFTeFDEfD6ndbk9uA1MKCpKuV",
  aggregators: [
    "ct_eHuWZ73XL8TaXT45ufkaA2UD1oaWBDMjgukaNjZps2zSSA8WN",
    "ct_CRTGDSECPC9LJJt3pASLzqWehJDHD18awuXPoGDnrBEXorCUx",
    "ct_RMwFZLJX6nCVtLmGoL8sYdDyuyNMxF4kpUoqWxrYMA2geitD1",
    "ct_uVtXFnXqxTEPtwnyT4HmucABaF7jzSK6VsR94EXxCS93pXfcX",
    "ct_T7DEvzRpmTokbkcYd1uPk5D3qQ6kr7rgPmX7VtspbwTrfdBL2",
    "ct_vwhNK8rj82HA7QX52QMJAH4AWtA79t1vrDnbkSY3vCjpgEbm6",
    "ct_oTHTNLdk2cnHEifcGyYGbd6PbpGmDkVy3v5ebC8mB5Ug3YK1Y",
    "ct_2H932kPcwLPpteUA3ZxdJgK9ztJqHiQkFdVkTJt3bkwL8BdN44",
    "ct_2NZKbwsn3aSsHenTT5e8vRZSW827GUmA5QABfJFxTdkaP5ABJw",
    "ct_2RQdR42mqJfjgeyVmZn83SvYNdkt9HjaJ18ZV1vsoM3UR3rXwQ",
    "ct_3vXZVNSpithtaumRdn3fZZbTB4xxrYba2Vr24k98M9XnHKNg2",
    "ct_2tZeg3eyEkjTCD5dfBX9Lgv2wpskvfqxb6mgNRwYQtn7Vk2Gu9",
    "ct_et77V1BVMmb3yA1nna9DLzmXQdgrs1NveLtasFDzCufM4pP3L",
    "ct_2tg2ppBeoXR44LWiuRvfu7Rd3a475s7s5FeKQM1Uftxy6ZfcHJ",
    "ct_294gvE61A9qaa3MfG7ZFcsoEELrCUy66m3Qhrtx1BetTKF3P8C"
  ],
  vrfs: [
    "ct_urTR8F2C37uGJq82m74nyRmQCgqBo8BuAu9MZYqoza4ta2FQn"
  ],
  consumer_url: "https://feaeder-consumer-h0e0gsemcpdrh5hr.canadacentral-01.azurewebsites.net/",
  aggregator_topic: "0x1",
  vrf_topic: "0x2"
