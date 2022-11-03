# SQLite uses a file URL, remove "file:" prefix from DATABASE_URL
pnpm prisma generate
DATABASE_FILE_PATH=${DATABASE_URL#*file:}
cd prisma
if [ ! -f "${DATABASE_FILE_PATH}" ]
then
  # create database file if it does not exist
  echo 'Database does not exist, pushing schema...'
  pnpm prisma db push
else 
  echo "Database already exists"
  # run prisma migration on sqlite *.db file in EFS
  pnpm prisma migrate deploy
  if [ $? -eq 1 ]; then
    echo "Migration failed, attempting to resolve"
    pnpm prisma migrate resolve
  fi
fi
cd -

# Run litestream with our app as the subprocess.
if [ "$ENABLE_DATABASE_BACKUP" = 'true' ]
then
  exec litestream replicate -exec "pnpm start"
else
  pnpm start
fi