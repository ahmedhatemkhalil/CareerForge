import Jasmine from "jasmine";

const jasmine = new Jasmine();

jasmine.env.clearReporters();

jasmine.addReporter({
  suiteStarted({ description }) {
    console.log(`\n📦 Suite: ${description}`);
  },

  specDone({ status, fullName, failedExpectations }) {
    if (status === "passed") {
      console.log(`  ✓ ${fullName}`);
    } else if (status === "failed") {
      console.log(`  ✗ ${fullName}`);
      failedExpectations.forEach(({ message }) => {
        console.log(`     ${message}`);
      });
    } else {
      console.log(`  - ${fullName} (${status})`);
    }
  },

  jasmineDone({ overallStatus }) {
    console.log("\n===================================");
    console.log(`🏁 Testing Finished! Status: ${overallStatus.toUpperCase()}`);
    console.log("===================================");

    process.exit(overallStatus === "passed" ? 0 : 1);
  },
});

jasmine.loadConfig({
  spec_dir: "tests",
  spec_files: ["**/*.spec.js"],
  helpers: [],
  env: {
    random: false,
    stopSpecOnExpectationFailure: false,
  },
  jsLoader: "import",
});

console.log("🚀 Running Jasmine Tests...\n");
process.env.NODE_ENV = "test";
jasmine.execute();