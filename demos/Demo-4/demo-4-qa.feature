Feature: Demo-4 automated documentation sync

  Scenario: The fixed Demo-4 target produces deterministic documentation status
    Given the bookstore source files are present at the fixed target
    When I run the documentation sync CLI for Demo-4
    Then the CLI reports two JavaScript files and two HTTP endpoints
    And API_DOCS.md reports both endpoints deterministically
    And a README.md without a valid marker pair is reported as blocked

  Scenario: A custom target outside Demo-4 is rejected
    Given a temporary JavaScript project outside the fixed target
    When I run the documentation sync CLI with that custom target
    Then the CLI rejects the custom target
    And no documentation is written outside the fixed target

  Scenario: Generated Markdown preserves marker-bounded documentation
    Given a temporary marked README and API documentation project
    When I run the documentation sync CLI against it
    Then generated Markdown contains the detected endpoint
    And human text outside the README markers is preserved
    And missing documentation files are created

  Scenario: Recognized secret values are redacted from CLI and Markdown
    Given a temporary JavaScript source contains recognized secret assignments
    When I run the documentation sync CLI
    Then the original secret values are absent from CLI output and generated Markdown
    And the documented secret names remain with REDACTED values

  Scenario: The generated bookstore HTML preview displays the starter catalog
    Given the bookstore demo data has been reset
    When I open the bookstore homepage in a browser
    Then the HTML preview displays the title and three starter books

  Scenario: Reset restores the demo catalog after a book is added
    Given the bookstore demo data has been reset
    When I add a temporary book and run resetDemo.js
    Then the starter catalog is restored in the browser and on disk
    And existing documentation files remain preserved
