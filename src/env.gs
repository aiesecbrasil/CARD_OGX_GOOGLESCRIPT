function getEnv() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const CLIENT_ID = scriptProperties.getProperty('CLIENT_ID');
  const CLIENT_SECRET = scriptProperties.getProperty('CLIENT_SECRET');
  const APP_ID = scriptProperties.getProperty('APP_ID');
  const APP_TOKEN = scriptProperties.getProperty('APP_TOKEN');
  const TOKEN_EXPA = scriptProperties.getProperty('TOKEN_EXPA');
  const GITHUB_TOKEN = scriptProperties.getProperty('GITHUB_TOKEN');
  const GITHUB_OWNER = scriptProperties.getProperty('GITHUB_OWNER');
  const GITHUB_REPO = scriptProperties.getProperty('GITHUB_REPO');
  const GITHUB_BRANCH = scriptProperties.getProperty('GITHUB_BRANCH');

  if (!CLIENT_ID || !CLIENT_SECRET || !APP_ID || !APP_TOKEN) {
    throw new Error("As variáveis de ambiente não estão definidas. Rode Env() ou configure manualmente.");
  }

  return { CLIENT_ID, CLIENT_SECRET, APP_ID, APP_TOKEN ,TOKEN_EXPA,GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO,
GITHUB_BRANCH};
}