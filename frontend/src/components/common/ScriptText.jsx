import useScript from '../../hooks/useScript';

export default function ScriptText({ arabic, latin, className = '', as: Component = 'span' }) {
  const { render, fontClass, direction } = useScript();

  const text = render(arabic, latin);
  const needsArabicFont = text && text !== latin;

  return (
    <Component
      dir={direction}
      className={`${needsArabicFont ? 'font-arabic' : ''} ${className}`}
    >
      {text}
    </Component>
  );
}
