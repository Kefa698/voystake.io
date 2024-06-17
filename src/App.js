// 1: Import
import React from 'react';
// import WebFont from 'webfontloader';
// import { useTheme } from './theme/useTheme';

import Stake from './components/stake';
import Farm from './components/farm';
import './App.css'

function App({path}) {
  // 3: Get the selected theme, font list, etc.
  // const {theme, getFonts} = useTheme();
  // const [, setSelectedTheme] = useState(theme);

  // useEffect(() => {
  //   setSelectedTheme(theme);
  //  }, [themeLoaded]);

  // 4: Load all the fonts
  // useEffect(() => {
  //   WebFont.load({
  //     google: {
  //       families: getFonts()
  //     }
  //   });
  // });

  // 5: Render if the theme is loaded.
  return (
    <>
      {
        path == "stake" ? 
          <Stake /> 
          : <Farm />
      }
    </>
  );
}

export default App;