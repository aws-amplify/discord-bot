# create database file if it does not exist
cd prisma
if [ ! -f "$DATABASE_URL" ]
then
  pnpm dlx prisma db push
else 
  # run prisma migration on sqlite *.db file in EFS
  pnpm dlx prisma migrate deploy
fi
cd -

# start bot
pnpm start