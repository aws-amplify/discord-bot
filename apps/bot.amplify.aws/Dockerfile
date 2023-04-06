# "workspace" is built from the project root, see "pnpm docker-build-workspace" in root package.json
FROM workspace
WORKDIR /app
# copy built files
COPY --from=builder /workspace/build/bot.amplify.aws ./build
# expose port
EXPOSE 3000
# start the app
CMD ["pnpm", "run", "start"]