import AureumLogo from "../assets/icons/aureum.svg";
import BizlandLogo from "../assets/icons/bizland.svg";
import BricksLogo from "../assets/icons/bricks.svg";
import BridgenextLogo from "../assets/icons/bridgenext.svg";
import EurekaLabsLogo from "../assets/icons/eurekalabs.svg";
import FravegaLogo from "../assets/icons/fravega.svg";
import FreitagLogo from "../assets/icons/freitag.svg";
import HearthLogo from "../assets/icons/hearth.svg";
import HiberusLogo from "../assets/icons/hiberus.svg";
import IplanLogo from "../assets/icons/iplan.svg";
import MagoyaLogo from "../assets/icons/magoya.svg";
import PatagonianLogo from "../assets/icons/patagonian.svg";
import S1Logo from "../assets/icons/s1.svg";
import SidomLogo from "../assets/icons/sidom.svg";
import TakenosLogo from "../assets/icons/takenos.svg";
import TgnLogo from "../assets/icons/tgn.svg";

export type Brand = {
  name: string;
  logo?: typeof MagoyaLogo;
};

export const brands: Brand[] = [
  { name: "Magoya", logo: MagoyaLogo },
  { name: "Patagonian", logo: PatagonianLogo },
  { name: "Sidom", logo: SidomLogo },
  { name: "Hearth", logo: HearthLogo },
  { name: "Hiberus", logo: HiberusLogo },
  { name: "Aureum", logo: AureumLogo },
  { name: "Bizland", logo: BizlandLogo },
  { name: "Bricks M2V", logo: BricksLogo },
  { name: "Bridgenext", logo: BridgenextLogo },
  { name: "iplan", logo: IplanLogo },
  { name: "TGN", logo: TgnLogo },
  { name: "Eureka Labs", logo: EurekaLabsLogo },
  { name: "Fravega", logo: FravegaLogo },
  { name: "S1", logo: S1Logo },
  { name: "Takenos", logo: TakenosLogo },
  { name: "Freitag", logo: FreitagLogo },
];
