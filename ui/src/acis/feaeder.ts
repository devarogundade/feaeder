export const aci = [
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
        "contract": {
            "event": {
                "variant": [
                    {
                        "SubscriptonCreated": [
                            "address",
                            "int"
                        ]
                    },
                    {
                        "SubscriptonTopup": [
                            "int",
                            "int"
                        ]
                    },
                    {
                        "SubscriptonWithdrawn": [
                            "int",
                            "int"
                        ]
                    },
                    {
                        "SubscriptonUsed": [
                            "int",
                            "int"
                        ]
                    },
                    {
                        "ConsumerAdded": [
                            "int",
                            "address"
                        ]
                    },
                    {
                        "ConsumerRemoved": [
                            "int",
                            "address"
                        ]
                    }
                ]
            },
            "functions": [
                {
                    "arguments": [
                        {
                            "name": "version",
                            "type": "int"
                        }
                    ],
                    "name": "init",
                    "payable": false,
                    "returns": "Feaeder.state",
                    "stateful": true
                },
                {
                    "arguments": [],
                    "name": "create_subscription",
                    "payable": false,
                    "returns": {
                        "tuple": []
                    },
                    "stateful": true
                },
                {
                    "arguments": [],
                    "name": "topup_subscrption",
                    "payable": true,
                    "returns": {
                        "tuple": []
                    },
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "amount",
                            "type": "int"
                        }
                    ],
                    "name": "withdraw_subscription",
                    "payable": false,
                    "returns": {
                        "tuple": []
                    },
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "subscription_id",
                            "type": "int"
                        },
                        {
                            "name": "consumer",
                            "type": "address"
                        },
                        {
                            "name": "cost",
                            "type": "int"
                        }
                    ],
                    "name": "use_subscription",
                    "payable": false,
                    "returns": {
                        "tuple": []
                    },
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "consumer",
                            "type": "address"
                        }
                    ],
                    "name": "add_consumer",
                    "payable": false,
                    "returns": {
                        "tuple": []
                    },
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "old_consumer",
                            "type": "address"
                        }
                    ],
                    "name": "remove_consumer",
                    "payable": false,
                    "returns": {
                        "tuple": []
                    },
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "new_allowed_contract",
                            "type": "address"
                        }
                    ],
                    "name": "add_allowed_contract",
                    "payable": false,
                    "returns": {
                        "tuple": []
                    },
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "old_allowed_contract",
                            "type": "address"
                        }
                    ],
                    "name": "remove_allowed_contract",
                    "payable": false,
                    "returns": {
                        "tuple": []
                    },
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "receiver",
                            "type": "address"
                        },
                        {
                            "name": "amount",
                            "type": "int"
                        }
                    ],
                    "name": "withdraw_admin",
                    "payable": false,
                    "returns": {
                        "tuple": []
                    },
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "owner",
                            "type": "address"
                        }
                    ],
                    "name": "get_subscription_id",
                    "payable": false,
                    "returns": "int",
                    "stateful": false
                },
                {
                    "arguments": [
                        {
                            "name": "subscription_id",
                            "type": "int"
                        }
                    ],
                    "name": "get_subscription",
                    "payable": false,
                    "returns": "Feaeder.subscription",
                    "stateful": false
                },
                {
                    "arguments": [
                        {
                            "name": "owner",
                            "type": "address"
                        }
                    ],
                    "name": "get_owner_subscription",
                    "payable": false,
                    "returns": "Feaeder.subscription",
                    "stateful": false
                }
            ],
            "kind": "contract_main",
            "name": "Feaeder",
            "payable": false,
            "state": {
                "record": [
                    {
                        "name": "controller",
                        "type": "address"
                    },
                    {
                        "name": "subscriptions",
                        "type": {
                            "map": [
                                "int",
                                "Feaeder.subscription"
                            ]
                        }
                    },
                    {
                        "name": "subscription_owners",
                        "type": {
                            "map": [
                                "address",
                                "int"
                            ]
                        }
                    },
                    {
                        "name": "last_subscription_id",
                        "type": "int"
                    },
                    {
                        "name": "version",
                        "type": "int"
                    },
                    {
                        "name": "allowed_contracts",
                        "type": {
                            "list": [
                                "address"
                            ]
                        }
                    }
                ]
            },
            "typedefs": [
                {
                    "name": "subscription",
                    "typedef": {
                        "record": [
                            {
                                "name": "id",
                                "type": "int"
                            },
                            {
                                "name": "creator",
                                "type": "address"
                            },
                            {
                                "name": "timestamp",
                                "type": "int"
                            },
                            {
                                "name": "version",
                                "type": "int"
                            },
                            {
                                "name": "balance",
                                "type": "int"
                            },
                            {
                                "name": "spent",
                                "type": "int"
                            },
                            {
                                "name": "consumers",
                                "type": {
                                    "list": [
                                        "address"
                                    ]
                                }
                            }
                        ]
                    },
                    "vars": []
                }
            ]
        }
    }
];