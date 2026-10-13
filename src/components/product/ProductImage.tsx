import Image from "next/image";

type Props = {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export default function ProductImage({ src, alt, sizes, className, priority }: Props) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
        이미지 없음
      </div>
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} className={className} priority={priority} />;
}
