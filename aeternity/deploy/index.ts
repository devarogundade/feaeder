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
    await AeUSDAg.run();
    await BnbUsdAg.run();
    await BtcEthAg.run();
    await BtcUsdAg.run();
    await BnbUsdAg.run();
    await CnyUsdAg.run();
    await EthBtcAg.run();
    await EthUsdAg.run();
    await EurUsdAg.run();
    await GbpUsdAg.run();
    await SolUsdAg.run();
    await UniUsdAg.run();
    await UsdcUsdAg.run();
    await UsdtUsdAg.run();
    await XagUsdAg.run();
    await XauUsdAg.run();
};

deploy();