import useScriptStore from '../store/scriptStore';
import { renderText, getDirection, getFontClass } from '../utils/scriptToggle';

export default function useScript() {
  const { scriptMode, setScriptMode } = useScriptStore();

  return {
    scriptMode,
    setScriptMode,
    render: (arabic, latin) => renderText(arabic, latin, scriptMode),
    direction: getDirection(scriptMode),
    fontClass: getFontClass(scriptMode),
    isRTL: scriptMode === 'arabic',
  };
}
