defmodule Websocket.MixProject do
  use Mix.Project

  def project do
    [
      app: :websocket,
      version: "0.1.0",
      elixir: "~> 1.15",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger],
      mod: {Websocket.Application, []}
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:websockex, "~> 0.4.3"},
      {:httpoison, "~> 2.0"},
      {:jason, "~> 1.4"}
    ]
  end
end
