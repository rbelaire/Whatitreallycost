import { config } from "dotenv";
import { render } from "react-email";
import WeeklyEmail from "../emails/weekly";
import { loadWeeklyProps } from "../lib/newsletter-data";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const props = await loadWeeklyProps();
  const html = await render(<WeeklyEmail {...props} />);
  process.stdout.write(html);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
