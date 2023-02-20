FROM workspace
WORKDIR /app
# copy built files
COPY --from=builder /workspace/dist/bot.amplify.aws ./dist
# expose port
EXPOSE 3000
# start the app
CMD ["pnpm", "run", "start"]