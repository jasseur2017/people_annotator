# Annotator
- Annotator toolkit is composed of three components: Front-end (ReactJs), Back-end (FastAPI) and Database (PostgreSQL).
- To run the toolkit just build and run Docker images of the three folders with Docker-Compose.

## Front-end
- Front-end serves images from Back-end to the operator.
- Front-end captures operator annotations and sends them to Back-end

## Back-end
- Back-end serves data annotation configuration (for example cfg/people_detection.json).
- Back-end serves images to Fron-end
- Back-end stores data annotations in the database
- Back-end shares data annotation process between multiple operators.

## Database
- Database persists all data annotations for future reusability.