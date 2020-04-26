import fs, { PathLike } from "fs";
import axios, { Method, AxiosPromise } from "axios";
import { Stream } from "stream";

export const exists = async (imageName: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    fs.access(imageName, fs.constants.F_OK, (err) => resolve(err === null));
  });

type LoadConfig = {
  url: string;
  output: PathLike;
  method?: Method;
};

export const load = ({ url, output, method = "get" }: LoadConfig) =>
  new Promise((resolve, reject) => {
    const req: AxiosPromise<Stream> = axios({
      method,
      url,
      responseType: "stream",
    });

    req
      .then((res) => {
        const outputStream = fs.createWriteStream(output);
        res.data.on("data", (chunk) => outputStream.write(chunk));
        res.data.on("end", () => {
          outputStream.end(() => resolve());
        });
      })
      .catch(reject);
  });
