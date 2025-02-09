import styles from "./DesertDrive.module.css";
import AssetCar from "./Car";

export default function Background() {
  return (
    <div>
      <div className={styles.sky}>
        <div className={styles.cloud}></div>
        <div className={styles.cloud} style={{ animationDelay: "-15s" }}></div>
        <div className={styles.cloud} style={{ animationDelay: "-30s" }}></div>
      </div>
      <div className={styles.desert}>
        <div className={styles.cactusContainer}>
          <div className={styles.cactus}></div>
          <div
            className={styles.cactus}
            style={{ animationDelay: "-20s" }}
          ></div>
          <div
            className={styles.cactus}
            style={{ animationDelay: "-40s" }}
          ></div>
        </div>
        <div className={styles.road}></div>
      </div>
      <div className={styles.car}>
        <AssetCar />
      </div>
    </div>
  );
}
