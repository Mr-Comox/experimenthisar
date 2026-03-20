import { gallery } from '../components/gallery/Collection';

export default function PreloadImages() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      {gallery.map((item) => {
        const src =
          typeof item.src === 'string'
            ? item.src
            : (item.src as { src: string }).src;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={item.id} src={src} alt='' fetchPriority='low' />
        );
      })}
    </div>
  );
}
