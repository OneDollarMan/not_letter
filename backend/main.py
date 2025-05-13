import asyncio
from ws import start_ws, update_user_maps_job
from apscheduler.schedulers.asyncio import AsyncIOScheduler


async def main():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(update_user_maps_job, 'interval', seconds=1)
    scheduler.start()
    await start_ws()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print('exiting')
        exit(0)
