import Feaeder from './feaeder';

import AeUSDAg from './aggregators/ae_usd_aggregator';
import BnbUsdAg from './aggregators/bnb_usd_aggregator';
import BtcEthAg from './aggregators/btc_eth_aggregator';
import BtcUsdAg from './aggregators/btc_usd_aggregator';
import CnyUsdAg from './aggregators/cny_usd_aggregator';
import EthBtcAg from './aggregators/eth_btc_aggregator';
import EthUsdAg from './aggregators/eth_usd_aggregator';
import EurUsdAg from './aggregators/eur_usd_aggregator';
import GbpUsdAg from './aggregators/gbp_usd_aggregator';
import SolUsdAg from './aggregators/sol_usd_aggregator';
import UniUsdAg from './aggregators/uni_usd_aggregator';
import UsdcUsdAg from './aggregators/usdc_usd_aggregator';
import UsdtUsdAg from './aggregators/usdt_usd_aggregator';
import XagUsdAg from './aggregators/xag_usd_aggregator';
import XauUsdAg from './aggregators/xau_usd_aggregator';
import RandomWords from './vrfs/random_words';

const deploy = async () => {
    const feaeder = await Feaeder.run();

    // const aeUsdAg = await AeUSDAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, aeUsdAg);

    // const bnbUsdAg = await BnbUsdAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, bnbUsdAg);

    // const btcEthAg = await BtcEthAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, btcEthAg);

    // const btcUsdAg = await BtcUsdAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, btcUsdAg);

    // const cnyUsdAg = await CnyUsdAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, cnyUsdAg);

    // const ethBtcAg = await EthBtcAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, ethBtcAg);

    // const ethUsdAg = await EthUsdAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, ethUsdAg);

    // const eurUsdAg = await EurUsdAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, eurUsdAg);

    // const gbpUsdAg = await GbpUsdAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, gbpUsdAg);

    // const solUsdAg = await SolUsdAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, solUsdAg);

    // const uniUsdAg = await UniUsdAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, uniUsdAg);

    // const usdcUsdAg = await UsdcUsdAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, usdcUsdAg);

    // const usdtUsdAg = await UsdtUsdAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, usdtUsdAg);

    // const xagUsdAg = await XagUsdAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, xagUsdAg);

    // const xauUsdAg = await XauUsdAg.run(feaeder.contractId);
    // await Feaeder.addAllowedContract(feaeder.contract, xauUsdAg);

    const randomWords = await RandomWords.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, randomWords);
};

deploy();
