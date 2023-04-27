import Image from "next/image";

interface IAvatarProps {
  src: string;
  height: number;
  width: number;
  alt: string;
}

export const Avatar = ({ src, height, width, alt }: IAvatarProps) => {
  return (
    <Image
      className="rounded-full"
      src={src}
      height={height}
      width={width}
      alt={alt}
    />
  );
};
