# SQLite uses a file URL, remove "file:" prefix from DATABASE_URL
DATABASE_FILE_PATH=${DATABASE_URL#*file:}
cd prisma
if [ ! -f "${DATABASE_FILE_PATH}" ]
then
  # create database file if it does not exist
  echo 'Database does not exist, pushing schema...'
  pnpm prisma db push
  echo 'Finished pushing schema'
else 
  echo "Database already exists at $DATABASE_FILE_PATH"
  pnpm prisma migrate deploy
  if [ $? -eq 1 ]; then
    echo "Migration failed, attempting to resolve"
    pnpm prisma migrate resolve
  fi
  echo "Finish existing database prep"
fi
cd -

pnpm start