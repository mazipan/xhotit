import { listen } from '@tauri-apps/api/event';

import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

import { useEffect, useState } from 'react';
import { EVENT } from '../constant';
import { message } from '@tauri-apps/plugin-dialog';
import { PreviewPanel } from './PreviewPanel';
import { GhostPanel } from './GhostPanel';
import { SettingPanel } from './SettingPanel';
import { ClassMap, DEFAULT_GRADIENT } from '../gradients';
import { EmptyState } from './EmptyState';

export const MainAppContainer = () => {
  const [selectedScreenshot, setSelectedScreenshot] = useState<
    string | undefined
  >();

  const [selectedGradient, setSelectedGradient] = useState<ClassMap | null>(
    DEFAULT_GRADIENT
  );

  const [padding, setPadding] = useState<number>(24);
  const [bgRounded, setBgRounded] = useState<number>(48);
  const [imgRounded, setImgRounded] = useState<number>(48);

  useEffect(() => {
    let unsubscribe = () => {};

    listen(EVENT.ON_SCREENSHOT, (res) => {
      setSelectedScreenshot(res.payload as string);
    }).then((fn) => (unsubscribe = fn));

    return () => {
      unsubscribe();
    };
  }, []);


  useEffect(() => {
    let unsubscribe = () => {};

    listen(EVENT.ON_REOPEN_APP_EVENT, (res) => {
      if (res.payload === 'start') {
        setSelectedScreenshot(undefined);
      }
    }).then((fn) => (unsubscribe = fn));

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};

    listen(EVENT.ON_GET_ACTIVE_WINDOW, async (res) => {
      if (res.payload === 'error') {
        await message(
          'Failed when trying to get active window position! Make sure you already give screen record permission',
          {
            title: 'Error Info',
            kind: 'error',
          }
        );
      }
    }).then((fn) => (unsubscribe = fn));

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="relative h-screen w-full">
      <Allotment vertical={false} separator={true}>
        {selectedScreenshot ? (
          <PreviewPanel
            image={selectedScreenshot}
            gradient={selectedGradient}
            padding={padding}
            bgRounded={bgRounded}
            imgRounded={imgRounded}
          />
        ) : (
          <EmptyState
            onPickNewImage={(newPath) => {
              setSelectedScreenshot(newPath);
            }}
          />
        )}

        {selectedScreenshot && (
          <Allotment.Pane minSize={230} maxSize={400} preferredSize={230}>
            <SettingPanel
              gradient={selectedGradient}
              onClickNewGradient={(newGradient) => {
                setSelectedGradient(newGradient);
              }}
              padding={padding}
              onChangePadding={(e) => {
                const newVal = e.target.value || '0';
                setPadding(parseInt(newVal, 10));
              }}
              bgRounded={bgRounded}
              onChangeBgRounded={(e) => {
                const newVal = e.target.value || '0';
                setBgRounded(parseInt(newVal, 10));
              }}
              imgRounded={imgRounded}
              onChangeImgRounded={(e) => {
                const newVal = e.target.value || '0';
                setImgRounded(parseInt(newVal, 10));
              }}
              onReset={() => {
                setSelectedScreenshot(undefined);
              }}
            />
          </Allotment.Pane>
        )}
      </Allotment>

      <GhostPanel
        image={selectedScreenshot}
        gradient={selectedGradient}
        padding={padding}
        bgRounded={bgRounded}
        imgRounded={imgRounded}
      />
    </div>
  );
};
