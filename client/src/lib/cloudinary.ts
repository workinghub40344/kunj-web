import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";
import { quality, format } from "@cloudinary/url-gen/actions/delivery";

const cld = new Cloudinary({
  cloud: { cloudName: "dm2kaeeri" },
});

export const getOptimizedImage = (url: string, width: number = 1000): string => {
  if (!url) return "";
  if (url.includes("q_auto") && url.includes("f_auto")) return url;

  const parts = url.split("/upload/");
  if (parts.length < 2) return url;

  const publicId = parts[1].replace(/^v\d+\//, "");

  return cld
    .image(publicId)
    .resize(scale().width(width))
    .delivery(quality("auto"))
    .delivery(format("auto"))
    .toURL();
};
