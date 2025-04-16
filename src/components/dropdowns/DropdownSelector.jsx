'use client'

import styles from './DropdownSelector.module.css';

export default function DropdownSelector({ options, selected, onSelect }) {
    return (
        <div className={styles['dropdown-hover-wrapper']} role="button">
            <div className={styles['custom-dropdown-container']}>
                <div className={styles['custom-dropdown-selected']}>{selected}</div>
            </div>
            <div className={styles['dropdown-hover-spacer']}/>
            <div className={styles['custom-dropdown-options']}>
                {options.map((option) => (
                    <div
                        key={option}
                        className={`${styles['custom-dropdown-option']} ${option === selected ? styles['selected'] : ''}`}
                        onMouseDown={() => onSelect(option)}
                    >
                        {option}
                    </div>
                ))}
            </div>
        </div>
    );
}
