import "./styles/index.css";

import { OverlayAppContainer } from "./overlay/OverlayAppContainer";
import { MainAppContainer } from "./main/MainAppContainer";
import { CompressAppContainer } from "./compress/CompressAppContainer";

type Props = {
  windowId?: string | null;
};

function App({ windowId }: Props) {
  if (windowId === "overlay") {
    import("./styles/styles.overlay.css");
    return <OverlayAppContainer />;
  } if (windowId === "compress") {
    import("./styles/styles.compress.css");
    return <CompressAppContainer />;
  } else {
    import("./styles/styles.main.css");
  }

  return <MainAppContainer />;
}

export default App;