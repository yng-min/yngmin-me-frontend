import styles from './StatBar.module.css'

export default function StatBar({ label, value, total, color }) {
    const percentage = total === 0 ? 0 : (value / total) * 100

    return (
        <div className={styles.statbar}>
            <div className={styles['statbar-label']}>
                <span>{label}</span>
                <span>{value} / {total}</span>
            </div>
            <div className={styles['statbar-track']}>
                <div
                    className={styles['statbar-fill']}
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
            </div>
        </div>
    )
}
