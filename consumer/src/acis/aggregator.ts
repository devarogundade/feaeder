/* eslint-disable prettier/prettier */

export const aci = [
    {
        "namespace": {
            "name": "Option",
            "typedefs": []
        }
    },
    {
        "namespace": {
            "name": "ListInternal",
            "typedefs": []
        }
    },
    {
        "namespace": {
            "name": "List",
            "typedefs": []
        }
    },
    {
        "namespace": {
            "name": "String",
            "typedefs": []
        }
    },
    {
        "contract": {
            "event": {
                "variant": [
                    {
                        "RoundDataAdded": [
                            "int",
                            "int"
                        ]
                    },
                    {
                        "RoundDataUpdated": [
                            "int",
                            "int"
                        ]
                    },
                    {
                        "RoundDataRemoved": [
                            "int"
                        ]
                    }
                ]
            },
            "functions": [
                {
                    "arguments": [
                        {
                            "name": "decimals",
                            "type": "int"
                        },
                        {
                            "name": "description",
                            "type": {
                                "option": [
                                    "string"
                                ]
                            }
                        },
                        {
                            "name": "version",
                            "type": "int"
                        },
                        {
                            "name": "tolerance",
                            "type": "int"
                        }
                    ],
                    "name": "init",
                    "payable": false,
                    "returns": "Aggregator.state",
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "question",
                            "type": "string"
                        },
                        {
                            "name": "qttl",
                            "type": "int"
                        },
                        {
                            "name": "rttl",
                            "type": "int"
                        }
                    ],
                    "name": "create_query",
                    "payable": true,
                    "returns": {
                        "oracle_query": [
                            "string",
                            "string"
                        ]
                    },
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "answers",
                            "type": {
                                "list": [
                                    "int"
                                ]
                            }
                        },
                        {
                            "name": "timestamp",
                            "type": "int"
                        }
                    ],
                    "name": "add_round_data",
                    "payable": false,
                    "returns": {
                        "tuple": []
                    },
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "round_id",
                            "type": "int"
                        },
                        {
                            "name": "answers",
                            "type": {
                                "list": [
                                    "int"
                                ]
                            }
                        },
                        {
                            "name": "timestamp",
                            "type": "int"
                        }
                    ],
                    "name": "update_round_data",
                    "payable": false,
                    "returns": {
                        "tuple": []
                    },
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "round_id",
                            "type": "int"
                        }
                    ],
                    "name": "remove_round_data",
                    "payable": false,
                    "returns": {
                        "tuple": []
                    },
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "query",
                            "type": {
                                "oracle_query": [
                                    "string",
                                    "string"
                                ]
                            }
                        }
                    ],
                    "name": "get_oracle_question",
                    "payable": false,
                    "returns": "string",
                    "stateful": false
                },
                {
                    "arguments": [
                        {
                            "name": "query",
                            "type": {
                                "oracle_query": [
                                    "string",
                                    "string"
                                ]
                            }
                        }
                    ],
                    "name": "get_oracle_answer",
                    "payable": false,
                    "returns": {
                        "option": [
                            "string"
                        ]
                    },
                    "stateful": false
                },
                {
                    "arguments": [
                        {
                            "name": "last_queries_idx",
                            "type": "int"
                        }
                    ],
                    "name": "get_query_address",
                    "payable": false,
                    "returns": {
                        "oracle_query": [
                            "string",
                            "string"
                        ]
                    },
                    "stateful": false
                },
                {
                    "arguments": [
                        {
                            "name": "round_id",
                            "type": "int"
                        }
                    ],
                    "name": "get_round_data",
                    "payable": false,
                    "returns": "Aggregator.datafeed",
                    "stateful": false
                },
                {
                    "arguments": [],
                    "name": "latest_round_data",
                    "payable": false,
                    "returns": "Aggregator.datafeed",
                    "stateful": false
                },
                {
                    "arguments": [],
                    "name": "get_metadata",
                    "payable": false,
                    "returns": "Aggregator.metadata",
                    "stateful": false
                },
                {
                    "arguments": [],
                    "name": "get_relayer",
                    "payable": false,
                    "returns": "address",
                    "stateful": false
                },
                {
                    "arguments": [],
                    "name": "get_state",
                    "payable": false,
                    "returns": "Aggregator.state",
                    "stateful": false
                },
                {
                    "arguments": [
                        {
                            "name": "query",
                            "type": {
                                "oracle_query": [
                                    "string",
                                    "string"
                                ]
                            }
                        },
                        {
                            "name": "answers",
                            "type": {
                                "list": [
                                    "int"
                                ]
                            }
                        }
                    ],
                    "name": "respond",
                    "payable": false,
                    "returns": {
                        "tuple": []
                    },
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "rttl",
                            "type": "int"
                        }
                    ],
                    "name": "extend_oracle",
                    "payable": false,
                    "returns": "unit",
                    "stateful": true
                }
            ],
            "kind": "contract_main",
            "name": "Aggregator",
            "payable": true,
            "state": {
                "record": [
                    {
                        "name": "relayer",
                        "type": "address"
                    },
                    {
                        "name": "metadata",
                        "type": "Aggregator.metadata"
                    },
                    {
                        "name": "rounds",
                        "type": {
                            "map": [
                                "int",
                                "Aggregator.datafeed"
                            ]
                        }
                    },
                    {
                        "name": "latest_round_id",
                        "type": "int"
                    },
                    {
                        "name": "tolerance",
                        "type": "int"
                    },
                    {
                        "name": "oracle",
                        "type": {
                            "oracle": [
                                "string",
                                "string"
                            ]
                        }
                    },
                    {
                        "name": "queries",
                        "type": {
                            "map": [
                                "int",
                                {
                                    "oracle_query": [
                                        "string",
                                        "string"
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        "name": "last_queries_idx",
                        "type": "int"
                    }
                ]
            },
            "typedefs": [
                {
                    "name": "metadata",
                    "typedef": {
                        "record": [
                            {
                                "name": "decimals",
                                "type": "int"
                            },
                            {
                                "name": "description",
                                "type": {
                                    "option": [
                                        "string"
                                    ]
                                }
                            },
                            {
                                "name": "version",
                                "type": "int"
                            }
                        ]
                    },
                    "vars": []
                },
                {
                    "name": "datafeed",
                    "typedef": {
                        "record": [
                            {
                                "name": "round_id",
                                "type": "int"
                            },
                            {
                                "name": "answer",
                                "type": "int"
                            },
                            {
                                "name": "timestamp",
                                "type": "int"
                            }
                        ]
                    },
                    "vars": []
                }
            ]
        }
    }
];