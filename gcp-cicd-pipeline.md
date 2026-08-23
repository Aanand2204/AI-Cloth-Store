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
   - In the Cloud Shell terminal, you can clone your GitHub/Gitlab repo if it's hosted there. 
   - `git clone <your-repo-url>`
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
```
*(Make sure to match the region to the one you chose in Artifact Registry)*.

5. **Commit the Configuration**:
   - Use the Source Control tab on the left sidebar of the Cloud Shell Editor to stage, commit, and push this new `cloudbuild.yaml` file to your repository.

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

Cloud Build needs permission to deploy to Cloud Run.
1. Go to **Cloud Build** > **Settings** in the GCP console.
2. In the "Service account permissions" section, find **Cloud Run Admin** and set the status to **ENABLE**.
3. Additionally, you may need to grant the **Service Account User** role to the Cloud Build service account via IAM.

## Phase 5: Test the Pipeline

1. Test it immediately in the GCP Console by going to **Cloud Build** > **Triggers** and clicking **RUN** on the trigger you just created.
2. Alternatively, use the Cloud Shell Editor to make a small change, commit it, and push it.
3. Go to **Cloud Build** > **History** to watch the pipeline execute. 

Once finished, navigate to **Cloud Run** in the GCP Console, click on your `cloth-store-backend` service, and you will find the live public URL for your deployed application!
