# CI/CD Pipeline Setup Guide for Google Cloud Platform (GCP)

This guide walks you through setting up a CI/CD pipeline using the **GCP Console (website)** and the **Google Cloud Shell Editor**, without using your local terminal. We use **Cloud Build** for Continuous Integration (CI), **Artifact Registry** for storing Docker images, and **Cloud Run** for Continuous Deployment (CD).

## Phase 1: Initial Setup via GCP Console

1. **Log into Google Cloud Console**: Go to [console.cloud.google.com](https://console.cloud.google.com/).
2. **Select/Create a Project**: Choose your project from the top dropdown or create a new one.
3. **Enable Required APIs**:
   - In the search bar at the top, search for and enable the following APIs:
     - **Cloud Build API**
     - **Artifact Registry API**
     - **Cloud Run Admin API**
4. **Create an Artifact Registry Repository**:
   - Go to **Artifact Registry** in the GCP Console.
   - Click **+ CREATE REPOSITORY**.
   - Name it `cloth-store-repo`.
   - Set the format to **Docker**.
   - Choose a region close to you (e.g., `us-central1`).
   - Click **Create**.

## Phase 2: Setup Code in Google Cloud Shell

1. **Open Google Cloud Shell**: Click the `>_` (Activate Cloud Shell) icon in the top right corner of the GCP Console.
2. **Open Cloud Shell Editor**: Once the shell opens at the bottom, click **Open Editor** (the pencil icon or "Open Editor" button) to get a VS Code-like interface in your browser.
3. **Clone Your Repository**:
   - In the Cloud Shell terminal, clone your GitHub/Gitlab repo if it's hosted there. 
   - `git clone <your-repo-url>`
   - Navigate into the project folder in the file explorer before proceeding.

### Important Preparations
- **Git Config**: Before committing for the first time in Cloud Shell, open the terminal and run:
  ```bash
  git config --global user.email "your-email@example.com"
  git config --global user.name "Your Name"
  ```
- **.gitignore**: Make sure your Python virtual environment folder (e.g., `clothenv/`, `venv/`, `env/`) is listed in your `.gitignore` file. If it isn't, Git will try to commit thousands of files, causing your editor to hang or take a very long time!

4. **Create a `cloudbuild.yaml` File**:
   - Using the Cloud Shell Editor, create a new file named `cloudbuild.yaml` at the root of your project.
   - Add the following CI/CD configuration:

```yaml
steps:
  # 1. Build the Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'us-central1-docker.pkg.dev/$PROJECT_ID/cloth-store-repo/main-app:$COMMIT_SHA', '.']
    
  # 2. Push the image to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'us-central1-docker.pkg.dev/$PROJECT_ID/cloth-store-repo/main-app:$COMMIT_SHA']

  # 3. Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'cloth-store-backend'
      - '--image'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/cloth-store-repo/main-app:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--allow-unauthenticated'
      - '--port'
      - '8000'

images:
  - 'us-central1-docker.pkg.dev/$PROJECT_ID/cloth-store-repo/main-app:$COMMIT_SHA'

options:
  logging: CLOUD_LOGGING_ONLY
```
*(Note: The `logging: CLOUD_LOGGING_ONLY` option prevents errors related to missing logs buckets when Cloud Build runs.)*

5. **Commit the Configuration**:
   - Use the Source Control tab on the left sidebar to stage, commit, and push this new `cloudbuild.yaml` file to your repository.

## Phase 3: Create the CI/CD Trigger in Cloud Build

1. Go back to the **GCP Console** and navigate to **Cloud Build** > **Triggers**.
2. Click **+ CREATE TRIGGER**.
3. **Configure the Trigger**:
   - **Name**: `cloth-store-pipeline`
   - **Event**: Choose "Push to a branch"
   - **Source**: Select your repository.
   - **Branch**: `^main$` (or whichever branch you want to deploy from).
   - **Configuration**: Select **Cloud Build configuration file (yaml or json)**.
   - **Location**: `cloudbuild.yaml`.
4. Click **Create**.

## Phase 4: Service Account Permissions (Crucial Step)

Your Cloud Build service account needs permission to push images and deploy to Cloud Run.

1. Go to **IAM & Admin** > **IAM** in the GCP console.
2. Find the service account being used by Cloud Build. This is usually your Default Compute Service Account (e.g., `123456789-compute@developer.gserviceaccount.com`).
3. Click the **pencil icon (Edit principal)** next to it.
4. Ensure it has the following roles (click **+ ADD ANOTHER ROLE** to add missing ones):
   - **Cloud Run Admin** (to deploy the service)
   - **Artifact Registry Writer** (to push the Docker image)
5. Click **Save**.

## Phase 5: Test the Pipeline

1. Test it immediately in the GCP Console by going to **Cloud Build** > **Triggers** and clicking **RUN**.
2. Go to **Cloud Build** > **History** to watch the pipeline execute. 

## Phase 6: Post-Deployment Configuration

### 1. Adding Environment Variables (Secrets & Database)
Because your `.env` file is excluded from Git (for security), Cloud Run won't have access to your database strings or API keys automatically, which will cause your application to crash on startup!

1. Go to **Cloud Run** in the GCP Console.
2. Click on your `cloth-store-backend` service.
3. Click **EDIT & DEPLOY NEW REVISION** at the top.
4. Go to the **Containers, Volumes, Networking, Security** tab.
5. Under **Variables & Secrets**, add all the variables from your local `.env` file (e.g., `MONGO_URI`, `GOOGLE_CLIENT_ID`, `GROQ_API_KEY`).
6. Click **DEPLOY**. 
*(Future automated deployments from Cloud Build will keep these variables intact).*

### 2. Fixing Google Auth Origin Mismatch
If you use Google Sign-In, you will get an `origin_mismatch` error when trying to log in on the live site because the Cloud Run URL isn't authorized.

1. Open a new tab and go to your **Cloud Run** service page. Copy the exact **URL** of your deployed service (e.g., `https://cloth-store-backend-xxxxxxxx-uc.a.run.app`).
2. Go to **APIs & Services** > **Credentials**.
3. Click on the correct OAuth 2.0 Client ID (ensure the Client ID string exactly matches the `GOOGLE_CLIENT_ID` environment variable you added to Cloud Run).
4. Under **Authorized JavaScript origins**, click **+ ADD URI** and paste your exact Cloud Run URL.
5. Do the same under **Authorized redirect URIs**.
6. Click **SAVE**. *(Note: Google can take 5-15 minutes to fully update this globally. Wait a few minutes before testing).*
