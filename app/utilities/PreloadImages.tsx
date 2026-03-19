import { gallery } from '../components/gallery/Collection';

export default function PreloadImages() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        visibility: 'hidden',
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
