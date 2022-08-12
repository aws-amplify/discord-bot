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
  echo "Database already exists, migrating..."
  # run prisma migration on sqlite *.db file in EFS
  pnpm prisma migrate deploy
  # if [ $? -eq 1 ]; then
  #   echo "Migration failed, attempting to resolve"
  #   pnpm prisma migrate resolve
  # fi
fi
cd -

# start bot
pnpm start