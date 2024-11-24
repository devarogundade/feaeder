import { assert } from 'chai';
import dotenv from 'dotenv';
import { describe, before, it } from 'node:test';
import { AeSdk, CompilerHttp, Contract, ContractMethodsBase, MemoryAccount, Node } from '@aeternity/aepp-sdk';
import { utils } from '@aeternity/aeproject';
import ContractWithMethods from '@aeternity/aepp-sdk/es/contract/Contract';
dotenv.config();