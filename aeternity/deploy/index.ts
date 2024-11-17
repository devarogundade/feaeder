import Feaeder from './feaeder';

import AeUSDAg from './ae_usd_aggregator';
import BnbUsdAg from './bnb_usd_aggregator';
import BtcEthAg from './btc_eth_aggregator';
import BtcUsdAg from './btc_usd_aggregator';
import CnyUsdAg from './cny_usd_aggregator';
import EthBtcAg from './eth_btc_aggregator';
import EthUsdAg from './eth_usd_aggregator';
import EurUsdAg from './eur_usd_aggregator';
import GbpUsdAg from './gbp_usd_aggregator';
import SolUsdAg from './sol_usd_aggregator';
import UniUsdAg from './uni_usd_aggregator';
import UsdcUsdAg from './usdc_usd_aggregator';
import UsdtUsdAg from './usdt_usd_aggregator';
import XagUsdAg from './xag_usd_aggregator';
import XauUsdAg from './xau_usd_aggregator';

const deploy = async () => {
    const feaeder = await Feaeder.run();

    const aeUsdAg = await AeUSDAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, aeUsdAg);

    const bnbUsdAg = await BnbUsdAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, bnbUsdAg);

    const btcEthAg = await BtcEthAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, btcEthAg);

    const btcUsdAg = await BtcUsdAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, btcUsdAg);

    const cnyUsdAg = await CnyUsdAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, cnyUsdAg);

    const ethBtcAg = await EthBtcAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, ethBtcAg);

    const ethUsdAg = await EthUsdAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, ethUsdAg);

    const eurUsdAg = await EurUsdAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, eurUsdAg);

    const gbpUsdAg = await GbpUsdAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, gbpUsdAg);

    const solUsdAg = await SolUsdAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, solUsdAg);

    const uniUsdAg = await UniUsdAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, uniUsdAg);

    const usdcUsdAg = await UsdcUsdAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, usdcUsdAg);

    const usdtUsdAg = await UsdtUsdAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, usdtUsdAg);

    const xagUsdAg = await XagUsdAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, xagUsdAg);

    const xauUsdAg = await XauUsdAg.run(feaeder.contractId);
    await Feaeder.addAllowedContract(feaeder.contract, xauUsdAg);
};

deploy();
