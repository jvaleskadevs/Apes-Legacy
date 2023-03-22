const CustomButton = ({ btnType, title, handleClick, styles }) => {
  return (
    <button
      type={btnType}
      onClick={handleClick}
      className={styles}
    >
      {title}
    </button>
  )
}

export default CustomButton;
