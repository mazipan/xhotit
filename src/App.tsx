import "./index.css";
import { OverlayAppContainer } from "./overlay/OverlayAppContainer";
import { MainAppContainer } from "./main/MainAppContainer";

type Props = {
  windowId?: string | null;
};

function App({ windowId }: Props) {
  if (windowId === "overlay") {
    import("./styles.overlay.css");
    return <OverlayAppContainer />;
  } else {
    import("./styles.main.css");
  }

  return <MainAppContainer />;
}

export default App;