FROM node:12.18.0-buster-slim@sha256:97da8d5023fd0380ed923d13f83041dd60b0744e4d140f6276c93096e85d0899

RUN  apt-get update \
  && apt-get install -y wget gnupg ca-certificates imagemagick \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  # We install Chrome to get all the OS level dependencies, but Chrome itself
  # is not actually used as it's packaged in the node puppeteer library.
  # Alternatively, we could could include the entire dep list ourselves
  # (https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix)
  # but that seems too easy to get out of date.
  && apt-get install -y google-chrome-stable libxss1 \
  && rm -rf /var/lib/apt/lists/* \
  && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
  && chmod +x /usr/sbin/wait-for-it.sh

RUN addgroup --system edashuser \
  && adduser --system edashuser --ingroup edashuser \
  && chown -R edashuser:edashuser /home/edashuser
USER edashuser
WORKDIR /home/edashuser

COPY --chown=edashuser:edashuser yarn.lock package.json ./

# TODO: Typescript compile for production env
# RUN yarn install --production
RUN yarn install


COPY --chown=edashuser:edashuser . ./

EXPOSE 8000
ENV ENV production
RUN npm run build
CMD [ "npm", "run", "start" ]
