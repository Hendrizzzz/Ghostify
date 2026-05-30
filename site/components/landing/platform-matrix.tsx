import { MATRIX_ROWS } from "./demo-stage-data";

export function PlatformMatrix() {
  return (
    <section className="section-block matrix-section" id="signals" aria-labelledby="platform-matrix-title">
      <div className="section-inner">
        <div className="section-heading">
          <h2 id="platform-matrix-title">Know which signal Ghostify handles before you install.</h2>
          <p>
            The matrix is built from the manifest, bundled patterns, and source checks in the extension.
            Statuses stay caveated because Meta surfaces change.
          </p>
        </div>

        <div className="matrix-table-wrap">
          <table className="matrix-table">
            <caption>Ghostify platform and signal support matrix</caption>
            <thead>
              <tr>
                <th scope="col">Platform</th>
                <th scope="col">Control</th>
                <th scope="col">Signal</th>
                <th scope="col">Status</th>
                <th scope="col">Evidence</th>
                <th scope="col">Interception layer</th>
                <th scope="col">Limitation</th>
                <th scope="col">Last audited</th>
              </tr>
            </thead>
            <tbody>
              {MATRIX_ROWS.map((row) => (
                <tr key={`${row.platform}-${row.control}`}>
                  <th scope="row">{row.platform}</th>
                  <td>{row.control}</td>
                  <td>
                    <code>{row.signal}</code>
                  </td>
                  <td>
                    <strong className={`matrix-status matrix-status-${row.status}`}>
                      {row.status}
                    </strong>
                  </td>
                  <td>{row.evidence}</td>
                  <td>{row.interception}</td>
                  <td>{row.caveat}</td>
                  <td>
                    <time dateTime={row.lastAudited}>{row.lastAudited}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
